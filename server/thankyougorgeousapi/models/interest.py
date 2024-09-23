from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Interest(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interests')
    product = models.ForeignKey(
        'Product', on_delete=models.CASCADE, related_name='interested_users'
    )
