from django.db import models
from django.conf import settings


class Order(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders'
    )
    completed = models.DateTimeField(null=True, blank=True)
    products = models.ManyToManyField(
        'Product', through='OrderProduct', related_name='orders'
    )
