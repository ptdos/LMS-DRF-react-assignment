from django.urls import path
from .views import user_list_create, current_user_profile, user_detail

urlpatterns = [
    path('auth/', user_list_create, name="user_list_create"),
    path('profile/', current_user_profile, name="current_user_profile"),
    path('<int:user_id>/', user_detail, name="user_detail"),
]
