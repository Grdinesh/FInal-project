from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import HousingListing, HousingMessage, HousingImage
from .serializers import HousingListingSerializer, HousingMessageSerializer, HousingImageSerializer


class HousingImageViewSet(viewsets.ModelViewSet):
    queryset = HousingImage.objects.all()
    serializer_class = HousingImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.listing.posted_by != self.request.user:
            raise PermissionDenied("You cannot delete this image.")
        instance.delete()
        
class HousingListingViewSet(viewsets.ModelViewSet):
    queryset = HousingListing.objects.all()
    serializer_class = HousingListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'city', 'address']
    ordering_fields = ['price', 'posted_date', 'average_rating']

    def get_queryset(self):
        queryset = HousingListing.objects.all().order_by('-posted_date')
        params = self.request.query_params

        if (search := params.get('search')):
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(city__icontains=search) |
                Q(address__icontains=search)
            )
        is_sold = params.get('is_sold')
        if is_sold is not None:
            if is_sold.lower() == 'true':
                queryset = queryset.filter(is_sold=True)
            elif is_sold.lower() == 'false':
                queryset = queryset.filter(is_sold=False)

        if (city := params.get('city')):
            queryset = queryset.filter(city__icontains=city.strip())

        if (wifi := params.get('has_wifi')) in ['true', 'false']:
            queryset = queryset.filter(has_wifi=(wifi == 'true'))

        if (furnished := params.get('is_furnished')) in ['true', 'false']:
            queryset = queryset.filter(is_furnished=(furnished == 'true'))

        if (val := params.get('bedrooms__gte')):
            queryset = queryset.filter(bedrooms__gte=val)

        if (val := params.get('bathrooms__gte')):
            queryset = queryset.filter(bathrooms__gte=val)

        if (val := params.get('square_feet__gte')):
            queryset = queryset.filter(square_feet__gte=val)

        if (val := params.get('square_feet__lte')):
            queryset = queryset.filter(square_feet__lte=val)


        return queryset

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        if self.get_object().posted_by != self.request.user:
            raise permissions.PermissionDenied("You can only update your own listings.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.posted_by != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own listings.")
        instance.delete()

    @action(detail=True, methods=['delete'], url_path='delete-image')
    def delete_image(self, request, pk=None):
        item = self.get_object()
        if item.posted_by != request.user:
            return Response({'detail': 'Unauthorized'}, status=403)
        item.image.delete(save=False)
        item.image = None
        item.save()
        return Response({'status': 'Image deleted'})

    @action(detail=True, methods=['post'])
    def mark_as_sold(self, request, pk=None):
        listing = self.get_object()
        if listing.posted_by != request.user:
            return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        listing.is_sold = True
        listing.save()
        return Response({'status': 'marked as sold'})

    @action(detail=True, methods=['post'])
    def mark_as_unsold(self, request, pk=None):
        listing = self.get_object()
        if listing.posted_by != request.user:
            return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        listing.is_sold = False
        listing.save()
        return Response({'status': 'marked as unsold'})

class HousingMessageViewSet(viewsets.ModelViewSet):
    queryset = HousingMessage.objects.all().order_by('-timestamp')
    serializer_class = HousingMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return HousingMessage.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('timestamp')

    @action(detail=False, methods=['get'])
    def by_item(self, request):
        item_id = request.query_params.get('item_id', None)
        other_user_id = request.query_params.get('other_user_id', None)

        if not item_id or not other_user_id:
            return Response({"detail": "Both item_id and other_user_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        messages = HousingMessage.objects.filter(
            Q(item_id=item_id) & (
                Q(sender=request.user, receiver_id=other_user_id) |
                Q(sender_id=other_user_id, receiver=request.user)
            )
        ).order_by('timestamp')

        unread_messages = messages.filter(receiver=request.user, is_read=False)
        for message in unread_messages:
            message.is_read = True
            message.save()

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)