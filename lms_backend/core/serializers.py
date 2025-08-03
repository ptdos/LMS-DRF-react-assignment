from rest_framework import serializers
from .models import Course, Category, Lesson, Material, Enrollment, QuestionAnswer


class CategorySerializer(serializers.ModelSerializer):
    courses_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Category
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    instructor_username = serializers.CharField(source='instructor_id.username', read_only=True)
    class Meta:
        model = Course
        #fields = '__all__'
        fields = ['id','title','description','price','duration','category_id', 'instructor_id',  'instructor_username', 'is_active']

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'        
class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class QuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAnswer
        fields = '__all__'