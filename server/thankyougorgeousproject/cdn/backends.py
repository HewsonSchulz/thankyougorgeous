from storages.backends.s3boto3 import S3Boto3Storage


class StaticRootS3Boto3Storage(S3Boto3Storage):
    location = 'static'


class MediaRootS3Boto3Storage(S3Boto3Storage):
    location = 'media'
    file_overwrite = False
    default_acl = 'public-read'

    def get_default_settings(self):
        defaults = super().get_default_settings()
        defaults['endpoint_url'] = 'https://nyc3.digitaloceanspaces.com'
        return defaults
