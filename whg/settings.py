"""
"""

import os
from celery.schedules import crontab
from django.contrib.messages import constants as messages

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_ID = 1
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.gis',
    'django.contrib.messages',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.staticfiles',

    # django-allauth 17 Feb 2021
    # 'allauth',
    # 'allauth.account',
    # 'allauth.socialaccount',

    # 3rd party
    'bootstrap_modal_forms',
    'captcha',
    'celery_progress',
    'django_celery_results',
    'django_extensions',
    'django_filters',
    'django_resized',
    'django_tables2',
    'django_user_agents',
    'djgeojson',
    'guardian',
    'leaflet',
    'mathfilters',
    'multiselectfield',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_datatables',
    'rest_framework_gis',
    'tinymce',

    # apps
    'accounts.apps.AccountsConfig',
    'api.apps.ApiConfig',
    'areas.apps.AreasConfig',
    'collection.apps.CollectionConfig',  # "collections" (plural) is reserved in python
    'datasets.apps.DatasetsConfig',
    'elastic.apps.ElasticConfig',
    'main.apps.MainConfig',
    'places.apps.PlacesConfig',
    'remote.apps.RemoteConfig',
    'resources.apps.ResourcesConfig', # for teaching
    'search.apps.SearchConfig',
    'traces.apps.TracesConfig',
    'users',
]

AUTH_USER_MODEL = 'users.User'

MIDDLEWARE = [
  'django.contrib.sessions.middleware.SessionMiddleware',
  'django.contrib.auth.middleware.AuthenticationMiddleware',
  'django.contrib.messages.middleware.MessageMiddleware',
  'django.middleware.clickjacking.XFrameOptionsMiddleware',
  'django.middleware.common.CommonMiddleware',
  'django.middleware.csrf.CsrfViewMiddleware',
  'django.middleware.locale.LocaleMiddleware',
  'django.middleware.security.SecurityMiddleware',
  'django_user_agents.middleware.UserAgentMiddleware',
]

ROOT_URLCONF = 'whg.urls'

PUBLIC_GROUP_ID = 'review'

TIME_ZONE = 'America/New_York'

MESSAGE_TAGS = {
        messages.DEBUG: 'alert-secondary',
        messages.INFO: 'alert-info',
        messages.SUCCESS: 'alert-success',
        messages.WARNING: 'alert-warning',
        messages.ERROR: 'alert-danger',
 }

CELERY_BROKER_URL = 'redis://localhost:6379'
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
# trying to throw error if no worker available
CELERY_TASK_EAGER_PROPAGATES = True
# required per https://github.com/celery/django-celery-results/issues/334
CELERY_RESULT_EXTENDED = True

CELERY_BEAT_SCHEDULE = {
  'task01': {
      'task': 'datasets.tasks.testy','schedule': crontab(minute='*/2')
    }}

CAPTCHA_NOISE_FUNCTIONS = (
  #'captcha.helpers.noise_arcs',
    'captcha.helpers.noise_dots',)

DJANGORESIZED_DEFAULT_SIZE = [1000, 800]
DJANGORESIZED_DEFAULT_QUALITY = 75
DJANGORESIZED_DEFAULT_KEEP_META = True
DJANGORESIZED_DEFAULT_FORCE_FORMAT = 'JPEG'
DJANGORESIZED_DEFAULT_FORMAT_EXTENSIONS = {'JPEG': ".jpg"}
DJANGORESIZED_DEFAULT_NORMALIZE_ROTATION = True

# replacement section from drf-datatables
# https://django-rest-framework-datatables.readthedocs.io/en/latest/
REST_FRAMEWORK = {
  'DEFAULT_RENDERER_CLASSES': (
      'rest_framework.renderers.JSONRenderer',
        #'api.views.PrettyJsonRenderer',
        #'rest_framework.renderers.BrowsableAPIRenderer',
        'rest_framework_datatables.renderers.DatatablesRenderer',
        ),
    'DEFAULT_FILTER_BACKENDS': (
      'rest_framework_datatables.filters.DatatablesFilterBackend',
        #'django_filters.rest_framework.DjangoFilterBackend'
        ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework_datatables.pagination.DatatablesPageNumberPagination',
    'PAGE_SIZE': 15000,
    'PAGE_SIZE': 20,
}

TEMPLATES = [
  {
      'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
          os.path.join(BASE_DIR, 'main/templates'),
            os.path.join(BASE_DIR, 'templates')
            ],
        'APP_DIRS': True,
        'OPTIONS': {
          'debug': True,
            'context_processors': [
              'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.debug',
                'django.template.context_processors.media',
                'django.template.context_processors.request',
                ],
            'builtins': [
              'whg.builtins',
            ]
            },
        },
]

WSGI_APPLICATION = 'whg.wsgi.application'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'whg/logs/debug.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

LEAFLET_CONFIG = {
  'TILES':[],
    'DEFAULT_CENTER': (35.0, 13.0),
    'DEFAULT_ZOOM': 1,
    'MIN_ZOOM': 1,
    'MAX_ZOOM': 14,
    'RESET_VIEW': False,
    #'MAX_BOUNDS_VISCOSITY': 0,
    'ATTRIBUTION_PREFIX':
    "Tiles &copy; <a href='http://mapbox.com/' target='_blank'>MapBox</a> | "+
    "<a href='http://creativecommons.org/licenses/by-nc/3.0/deed.en_US' target='_blank'> CC-BY-NC 3.0</a>"
}

LOGIN_URL = '/accounts/login/'
LOGIN_REDIRECT_URL='/accounts/login/'
LOGOUT_REDIRECT_URL='/'


# /././././././.
# start django-allauth
# /././././././.
#
# ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS =1
# ACCOUNT_EMAIL_REQUIRED = True
# ACCOUNT_EMAIL_VERIFICATION = "mandatory"
# ACCOUNT_LOGIN_ATTEMPTS_LIMIT = 5
# ACCOUNT_LOGIN_ATTEMPTS_TIMEOUT = 86400 # 1 day in seconds
#
# ACCOUNT_LOGOUT_REDIRECT_URL ='/'
# LOGIN_REDIRECT_URL = '/accounts/email/' # default to /accounts/profile

# ACCOUNT_FORMS = {'signup': 'allauth.account.forms.WHGRegisterForm',}

#SOCIALACCOUNT_PROVIDERS = {
  ## For each OAuth based provider, either add a ``SocialApp``
  ## (``socialaccount`` app) containing the required client
  ## credentials, or list them here:
  #'github': {
    #'APP': {
      #'client_id': '123',
      #'secret': '456',
      #'key': ''
    #}
  #},
  #'orcid': {
      ## Base domain of the API. Default value: 'orcid.org', for the production API
      #'BASE_DOMAIN':'sandbox.orcid.org',  # for the sandbox API
      ## Member API or Public API? Default: False (for the public API)
      #'MEMBER_API': True,  # for the member API
  #}}
# /././././././.
# end django-allauth
# /././././././.

AUTHENTICATION_BACKENDS = (
  'django.contrib.auth.backends.ModelBackend', # default
  'guardian.backends.ObjectPermissionBackend',
  # 'allauth.account.auth_backends.AuthenticationBackend',
)

# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
  {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]


# Internationalization
# https://docs.djangoproject.com/en/2.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True
USE_L10N = True

# disabled for new psycopg2 config
# USE_TZ = True

MEDIA_ROOT = os.path.join(BASE_DIR, 'media/')
MEDIA_URL = '/media/'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.0/howto/static-files/
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = [
  os.path.join(BASE_DIR, 'datasets/static/'),
    os.path.join(BASE_DIR, 'main/static/'),
    os.path.join(BASE_DIR, 'whg/static/'),
]

try:
  from .local_settings import *
except ImportError:
  pass
