from django.db import models
from django.utils import timezone
from datetime import timedelta


class EmailCodeManager(models.Manager):
    def clean_up_old_codes(self):
        ten_minutes_ago = timezone.now() - timedelta(minutes=10)

        # delete all verification codes older than 10 minutes
        self.filter(created__lt=ten_minutes_ago).delete()

        # keep only the most recent verification code for each email
        emails_with_multiple_codes = (
            self.values('email').annotate(codes=models.Count('id')).filter(codes__gt=1)
        )
        for email_data in emails_with_multiple_codes:
            email = email_data['email']
            most_recent_code = self.filter(email=email).order_by('-created').first()
            codes_to_delete = self.filter(email=email).exclude(id=most_recent_code.id)
            codes_to_delete.delete()


class EmailCode(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    email = models.CharField(max_length=255)
    code = models.CharField(max_length=6)

    objects = EmailCodeManager()
