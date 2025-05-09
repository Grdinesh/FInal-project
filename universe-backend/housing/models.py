# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class HousingListing(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    bedrooms = models.IntegerField(default=1)
    bathrooms = models.IntegerField(default=1)
    square_feet = models.IntegerField(null=True, blank=True)
    is_furnished = models.BooleanField(default=False)
    has_wifi = models.BooleanField(default=True)
    amenities = models.TextField(blank=True, help_text="Comma-separated list (e.g. gym, pool, parking)")
    image = models.ImageField(upload_to='housing_images/', null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    average_rating = models.FloatField(default=0.0)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE)
    source = models.CharField(max_length=20, default='user')  # user or external or bridge_api
    posted_date = models.DateTimeField(auto_now_add=True)
    is_sold = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class HousingMessage(models.Model):
    item = models.ForeignKey(HousingListing, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_housing_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_housing_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username}"

class HousingImage(models.Model):
    listing = models.ForeignKey('HousingListing', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='housing_images/')

    def __str__(self):
        return f"Image for {self.listing.title}"