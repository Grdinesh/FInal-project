from django.contrib import admin
from .models import HousingListing, HousingMessage

admin.site.register(HousingListing)
admin.site.register(HousingMessage)