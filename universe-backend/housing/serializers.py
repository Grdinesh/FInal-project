from rest_framework import serializers
from .models import HousingListing, HousingMessage, HousingImage

from .models import HousingListing, HousingImage
from rest_framework import serializers


class HousingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HousingImage
        fields = ['id', 'image']


class HousingListingSerializer(serializers.ModelSerializer):
    images = HousingImageSerializer(many=True, read_only=True)

    class Meta:
        model = HousingListing
        fields = '__all__'
        read_only_fields = ['posted_by']

    def create(self, validated_data):
        request = self.context.get('request')
        images = request.FILES.getlist('images')

        listing = HousingListing.objects.create(
            posted_by=request.user,
            **validated_data
        )

        for image in images:
            HousingImage.objects.create(listing=listing, image=image)

        return listing

    def update(self, instance, validated_data):
        request = self.context.get('request')
        new_images = request.FILES.getlist('images')

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        for img in new_images:
            HousingImage.objects.create(listing=instance, image=img)

        return instance
    


class HousingMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.SerializerMethodField()
    receiver_username = serializers.SerializerMethodField()

    class Meta:
        model = HousingMessage
        fields = '__all__'
        read_only_fields = ['sender']

    def get_sender_username(self, obj):
        return obj.sender.username

    def get_receiver_username(self, obj):
        return obj.receiver.username

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)
