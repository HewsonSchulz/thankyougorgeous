from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # add additional fields
    is_admin = models.BooleanField(default=False)
    phone_num = models.IntegerField(null=True, blank=True)
    venmo = models.CharField(max_length=255, null=True, blank=True)
    cashapp = models.CharField(max_length=255, null=True, blank=True)
    paypal = models.CharField(max_length=255, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    # set email field as unique identifier for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    # add unique constraint to email field
    email = models.EmailField(unique=True)

    # remove unique constraint from username field
    username = models.CharField(max_length=150, unique=False)
