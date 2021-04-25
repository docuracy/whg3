# Generated by Django 2.2.20 on 2021-04-24 16:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('places', '0014_auto_20200521_1408'),
    ]

    operations = [
        migrations.AddField(
            model_name='place',
            name='review_tgn',
            field=models.CharField(choices=[('reviewed', 'Reviewed'), ('deferred', 'Deferred')], max_length=1, null=True),
        ),
        migrations.AddField(
            model_name='place',
            name='review_wd',
            field=models.CharField(choices=[('reviewed', 'Reviewed'), ('deferred', 'Deferred')], max_length=1, null=True),
        ),
        migrations.AddField(
            model_name='place',
            name='review_whg',
            field=models.CharField(choices=[('reviewed', 'Reviewed'), ('deferred', 'Deferred')], max_length=1, null=True),
        ),
    ]
