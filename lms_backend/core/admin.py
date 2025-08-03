from django.contrib import admin
from .models import Course, Category, Lesson, Material, Enrollment, QuestionAnswer
# Register your models here.


admin.site.register(Category)
admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(Material)
admin.site.register(Enrollment)
admin.site.register(QuestionAnswer)