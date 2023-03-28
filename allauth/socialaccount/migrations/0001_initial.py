# Generated by Django 4.1.7 on 2023-03-28 14:20

import allauth.socialaccount.fields
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('sites', '0002_alter_domain_unique'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SocialAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('provider', models.CharField(choices=[], max_length=30, verbose_name='provider')),
                ('uid', models.CharField(max_length=191, verbose_name='uid')),
                ('last_login', models.DateTimeField(auto_now=True, verbose_name='last login')),
                ('date_joined', models.DateTimeField(auto_now_add=True, verbose_name='date joined')),
                ('extra_data', allauth.socialaccount.fields.JSONField(default=dict, verbose_name='extra data')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'social account',
                'verbose_name_plural': 'social accounts',
                'unique_together': {('provider', 'uid')},
            },
        ),
        migrations.CreateModel(
            name='SocialApp',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('provider', models.CharField(choices=[], max_length=30, verbose_name='provider')),
                ('name', models.CharField(max_length=40, verbose_name='name')),
                ('client_id', models.CharField(help_text='App ID, or consumer key', max_length=191, verbose_name='client id')),
                ('secret', models.CharField(blank=True, help_text='API secret, client secret, or consumer secret', max_length=191, verbose_name='secret key')),
                ('key', models.CharField(blank=True, help_text='Key', max_length=191, verbose_name='key')),
                ('sites', models.ManyToManyField(blank=True, to='sites.site')),
            ],
            options={
                'verbose_name': 'social application',
                'verbose_name_plural': 'social applications',
            },
        ),
        migrations.CreateModel(
            name='SocialToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.TextField(help_text='"oauth_token" (OAuth1) or access token (OAuth2)', verbose_name='token')),
                ('token_secret', models.TextField(blank=True, help_text='"oauth_token_secret" (OAuth1) or refresh token (OAuth2)', verbose_name='token secret')),
                ('expires_at', models.DateTimeField(blank=True, null=True, verbose_name='expires at')),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='socialaccount.socialaccount')),
                ('app', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='socialaccount.socialapp')),
            ],
            options={
                'verbose_name': 'social application token',
                'verbose_name_plural': 'social application tokens',
                'unique_together': {('app', 'account')},
            },
        ),
    ]
