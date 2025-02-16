from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from thankyougorgeousproject.cdn.backends import MediaRootS3Boto3Storage


class Product(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    label = models.CharField(max_length=255)
    price = models.FloatField()
    description = models.TextField()
    categories = models.ManyToManyField('Category', related_name='products')
    quantity = models.IntegerField()
    image = models.ImageField(
        storage=MediaRootS3Boto3Storage(),  # ensure correct storage class is used
        upload_to='product_images',
        null=True,
        blank=True,
    )
    # is_deal = models.BooleanField(default=False)

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower('label'), name='product_label_case_insensitive_unique'
            )
        ]
