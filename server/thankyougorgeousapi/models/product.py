from django.db import models


class Product(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    label = models.CharField(max_length=255, unique=True)
    price = models.FloatField()
    description = models.TextField()
    categories = models.ManyToManyField('Category', related_name='products')
    # TODO: image = models.ImageField()
