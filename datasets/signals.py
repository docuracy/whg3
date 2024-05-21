# datasets.signals.py
# when created; when public; when indexed

from django.conf import settings
from django.db import transaction
from django.db.models.signals import pre_delete, pre_save, post_save
from django.dispatch import receiver

from .models import Dataset, DatasetFile
from utils.emailing import new_emailer

import logging

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Dataset)
def send_new_dataset_email(sender, instance, **kwargs):
  if instance.pk:  # if instance exists
    old_instance = Dataset.objects.get(pk=instance.pk)
    # if old_instance.ds_status != instance.ds_status and instance.ds_status == 'uploaded':
    # Check if the old_instance.ds_status is None, indicating a new instance
    owner_name = instance.owner.name if instance.owner.name else instance.owner.username
    if old_instance.ds_status is None and instance.ds_status == 'uploaded':
      try:
        if not instance.owner.groups.filter(name='whg_team').exists():
          new_emailer(
            email_type='new_dataset',
            subject='New Dataset Created',
            from_email=settings.DEFAULT_FROM_EMAIL,
            to_email=settings.EMAIL_TO_ADMINS,
            name=owner_name,
            username=instance.owner.username,
            dataset_title=instance.title,
            dataset_label=instance.label,
            dataset_id=instance.id
          )
      except Exception as e:
        logger.exception("Error occurred while sending new dataset email")

def format_time(seconds):
  minutes, seconds = divmod(seconds, 60)
  return f"{minutes} minutes {seconds} seconds"

def test_complexity(dsid):
  import time
  start = time.time()
  from main.tasks import needs_tileset
  # Call the function directly
  object_needs_tileset, total_coords, total_geometries = needs_tileset('datasets', dsid)
  end = time.time()
  # Print the result
  duration = format_time(end - start)
  print(f'object_needs_tileset: {object_needs_tileset}, total_coords: {total_coords}, total_geometries: {total_geometries}, total_places: {total_places}, time: {duration} ')

@receiver(pre_save, sender=Dataset)
def handle_public_flag(sender, instance, **kwargs):
  from .tasks import index_to_pub, unindex_from_pub
  from main.tasks import process_tileset_request, needs_tileset
  
  task_timeout = 60 * 5  # 5 minutes

  if instance.id:  # Check if it's an existing instance, not new
    old_instance = sender.objects.get(pk=instance.pk)
    if old_instance.public != instance.public:  # There's a change in 'public' status
      owner = instance.owner
      if instance.public:
        new_emailer(
          email_type='dataset_published',
          subject='Your WHG dataset has been published',
          from_email=settings.DEFAULT_FROM_EMAIL,
          to_email=[owner.email],
          reply_to=[settings.DEFAULT_FROM_EDITORIAL],
          name=owner.name,
          greeting_name=owner.name if owner.name else owner.username,
          dataset_title=instance.title,
          dataset_label=instance.label,
          dataset_id=instance.id
        )

        # Changed from False to True, index the records
        transaction.on_commit(lambda: index_to_pub.delay(instance.id))

        # Calculate the complexity of the geometries
        needs_tileset_task = needs_tileset.apply_async(args=['datasets',instance.id], expires=task_timeout)
        object_needs_tileset, _, _, _ = needs_tileset_task.get(timeout=task_timeout)

        # Changed from False to True, create a tileset if the geometry or coordinate counts exceeds the thresholds
        if object_needs_tileset:
          transaction.on_commit(lambda: process_tileset_request.delay('datasets', instance.id, 'generate'))

        # remove from volunteers needed page
        # if instance.volunteers:
        #   instance.volunteers = False
        #   instance.save()
      else:
        # Changed from True to False, remove the records from the index
        transaction.on_commit(lambda: unindex_from_pub.delay(instance.id))
        # notify the owner
        owner = instance.owner
        new_emailer(
          email_type='dataset_unpublished',
          subject='Your WHG dataset has been unpublished',
          from_email=settings.DEFAULT_FROM_EMAIL,
          to_email=[owner.email],
          reply_to=[settings.DEFAULT_FROM_EDITORIAL],
          name=owner.name,
          greeting_name=owner.name if owner.name else owner.username,
          dataset_title=instance.title,
          dataset_label=instance.label,
          dataset_id=instance.id
        )


# notify the owner when status changes to 'wd-complete' or 'indexed'
@receiver(pre_save, sender=Dataset)
def handle_status_change(sender, instance, **kwargs):
  # Check if the handler is already running
  if hasattr(instance, '_updating'):
    return
  setattr(instance, '_updating', True)
  print(f'handle_status_change(): status: {instance.ds_status}, is public?: {instance.public}')
  try:
    if instance.pk is not None:  # Check if it's an existing instance, not new
      old_instance = sender.objects.get(pk=instance.pk)
      # Check whether 'ds_status' has been changed to 'wd-complete'
      # and notify the owner, bcc to editorial
      if old_instance.ds_status != instance.ds_status and instance.ds_status == 'wd-complete':
        print('handle_status_change: ds_status changed to wd-complete')
        owner = instance.owner
        new_emailer(
          email_type='wikidata_review_complete',
          subject='WHG reconciliation review complete',
          from_email=settings.DEFAULT_FROM_EMAIL,
          # to_email=[settings.EMAIL_TO_ADMINS],
          to_email=[owner.email],
          reply_to=[settings.DEFAULT_FROM_EDITORIAL],
          bcc=[settings.DEFAULT_FROM_EDITORIAL],
          name=owner.name,
          greeting_name=owner.name if owner.name else owner.username,
          dataset_title=instance.title,
          dataset_label=instance.label,
          dataset_id=instance.id,
          editorial=settings.DEFAULT_FROM_EDITORIAL
        )
        # print('handle_status_change: wd-complete')
        # remove from volunteers needed page
        instance.volunteers = False
        instance.save(update_fields=['volunteers'])

      # Check whether 'ds_status' has been changed to 'indexed'
      if old_instance.ds_status != instance.ds_status and instance.ds_status == 'indexed':
        # print('handle_status_change: ds_status changed to indexed')
        owner = instance.owner
        new_emailer(
          email_type='dataset_indexed',
          subject='Your WHG dataset is fully indexed',
          from_email=settings.DEFAULT_FROM_EMAIL,
          to_email=[owner.email],
          reply_to=[settings.DEFAULT_FROM_EDITORIAL],
          bcc=[settings.DEFAULT_FROM_EDITORIAL],
          name=owner.name,
          greeting_name=owner.name if owner.name else owner.username,
          dataset_title=instance.title,
          dataset_label=instance.label,
          dataset_id=instance.id
        )
        # remove from volunteers needed page
        instance.volunteers = False
        instance.save(update_fields=['volunteers'])

  finally:
      # Remove the flag once done
      delattr(instance, '_updating')
  # except Exception as e:
  #   print('send_dataset_email error:', e)
  #   logger.exception("Error occurred while sending dataset email")


@receiver(pre_delete, sender=Dataset)
def remove_files(**kwargs):
  print('pre_delete remove_files()', kwargs)
  ds_instance = kwargs.get('instance')
  files = DatasetFile.objects.filter(dataset_id_id=ds_instance.id)
  files.delete()
