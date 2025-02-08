import os

AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')

AWS_STORAGE_BUCKET_NAME = 'thankyougorgeous-bucket'
AWS_S3_ENDPOINT_URL = 'https://nyc3.digitaloceanspaces.com'
AWS_LOCATION = 'https://thankyougorgeous-bucket.nyc3.digitaloceanspaces.com'

STATICFILES_STORAGE = 'thankyougorgeousproject.cdn.backends.StaticRootS3Boto3Storage'
DEFAULT_FILE_STORAGE = 'thankyougorgeousproject.cdn.backends.MediaRootS3Boto3Storage'
