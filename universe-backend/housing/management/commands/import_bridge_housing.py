from django.core.management.base import BaseCommand
from housing.models import HousingListing
from django.contrib.auth.models import User
import requests

class Command(BaseCommand):
    help = 'Import housing listings from Bridge API'

    def handle(self, *args, **kwargs):
        url = "https://api.bridgedataoutput.com/api/v2/test/listings"
        token = "6baca547742c6f96a6ff71b138424f21"
        params = {
            "access_token": token,
            "limit": 100
        }

        response = requests.get(url, params=params)
        if response.status_code != 200:
            self.stderr.write("Failed to fetch data from Bridge API")
            return

        listings = response.json().get("bundle", [])
        system_user, _ = User.objects.get_or_create(username="bridge_importer", defaults={"is_active": False})

        created = 0
        for entry in listings:
            title = f"Bridge Listing #{entry.get('ListingId', 'N/A')}"
            address = entry.get("City", "San Jose")
            description = entry.get("PublicRemarks", "Imported from Bridge API")
            latitude = entry.get("Latitude")
            longitude = entry.get("Longitude")
            price = entry.get("ListPrice", 0)
            bedrooms = entry.get("BedroomsTotal", 1)
            bathrooms = entry.get("BathroomsTotalInteger", 1)
            square_feet = entry.get("LivingArea")
            amenities = []

            for key in ["FireplaceFeatures", "Appliances", "ExteriorFeatures", "AccessibilityFeatures"]:
                features = entry.get(key)
                if isinstance(features, list):
                    amenities.extend(features)

            amenity_text = ", ".join(amenities)
            image_url = None
            media = entry.get("Media")
            if isinstance(media, list) and media:
                image_url = media[0].get("MediaURL")

            listing, created_flag = HousingListing.objects.update_or_create(
                title=title,
                address=address,
                city="San Jose",
                posted_by=system_user,
                defaults={
                    "description": description,
                    "price": price,
                    "bedrooms": bedrooms,
                    "bathrooms": bathrooms,
                    "square_feet": square_feet,
                    "is_furnished": False,
                    "has_wifi": True,
                    "amenities": amenity_text,
                    "latitude": latitude,
                    "longitude": longitude,
                    "source": "bridge_api"
                }
            )

            if image_url and not listing.image:
                listing.image = image_url
                listing.save()

            if created_flag:
                created += 1

        self.stdout.write(self.style.SUCCESS(f"Imported {created} listings from Bridge API."))
