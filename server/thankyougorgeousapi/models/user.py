from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # add `is_admin` property
    is_admin = models.BooleanField(default=False)

    # set email field as unique identifier for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    # add unique constraint to email field
    email = models.EmailField(unique=True)
