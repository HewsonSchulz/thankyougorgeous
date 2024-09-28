from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower


class Category(models.Model):
    label = models.CharField(max_length=255)

    class Meta:
        constraints = [
            UniqueConstraint(
                Lower('label'), name='category_label_case_insensitive_unique'
            )
        ]
