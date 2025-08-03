from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Category, Course, Lesson, Material, Enrollment, QuestionAnswer
from .serializers import (
    CategorySerializer, CourseSerializer, LessonSerializer, MaterialSerializer,
    EnrollmentSerializer, QuestionAnswerSerializer
)
from django.db.models import Count
from drf_yasg.utils import swagger_auto_schema

# Admin statistics
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    if request.user.role != 'admin':
        return Response({'detail': 'Admin only'}, status=403)
    from users.models import User
    data = {
        'total_users': User.objects.count(),
        'total_admins': User.objects.filter(role='admin').count(),
        'total_teachers': User.objects.filter(role='teacher').count(),
        'total_students': User.objects.filter(role='student').count(),
        'total_courses': Course.objects.count(),
        'total_enrollments': Enrollment.objects.count(),
    }
    return Response(data)

# Categories: list/create/update/delete (admin only)
@swagger_auto_schema(method='post', request_body=CategorySerializer)
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def category_list_create(request):
    if request.method == 'GET':
        #categories = Category.objects.all()
        categories = Category.objects.annotate(courses_count=Count('course'))
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if request.user.role != 'admin':
            return Response({"detail": "Only admin can create categories."}, status=403)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    if request.method == 'PUT':
        if request.user.role != 'admin':
            return Response({"detail": "Only admin can update categories."}, status=403)
        cat_id = request.data.get('id')
        if not cat_id:
            return Response({"detail": "Category id is required."}, status=400)
        try:
            category = Category.objects.get(id=cat_id)
        except Category.DoesNotExist:
            return Response({"detail": "Category not found."}, status=404)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        if request.user.role != 'admin':
            return Response({"detail": "Only admin can delete categories."}, status=403)
        cat_id = request.data.get('id')
        if not cat_id:
            return Response({"detail": "Category id is required."}, status=400)
        try:
            category = Category.objects.get(id=cat_id)
        except Category.DoesNotExist:
            return Response({"detail": "Category not found."}, status=404)
        category.delete()
        return Response({"detail": "Category deleted."}, status=204)



# Instructors helper: list all instructor users for frontend selection
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_instructors(request):
    if request.user.role != 'admin':
        return Response({'detail': 'Admin only'}, status=403)
    from users.models import User
    instructors = User.objects.filter(role='teacher').values('id', 'username', 'email')
    return Response(list(instructors))


# Courses: list/create
@swagger_auto_schema(method='post', request_body=CourseSerializer)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def course_list_create(request):
    if request.method == 'GET':
        if request.user.role == 'admin':
            courses = Course.objects.all()
        elif request.user.role == 'teacher':
            courses = Course.objects.filter(instructor_id=request.user)
        elif request.user.role == 'student':
            # TO DO: filter to enrolled courses only if desired
            courses = Course.objects.all()
        else:
            return Response({'detail': 'Unauthorized role'}, status=403)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if request.user.role not in ['admin', 'teacher']:
            return Response({'detail': 'Only admins or teachers can create courses.'}, status=403)
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            #serializer.save(instructor_id=request.user)
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# Course detail: view/update/delete (owner or admin)
@swagger_auto_schema(method='put', request_body=CourseSerializer)
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def course_detail(request, pk):
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({'detail': 'Course not found'}, status=404)

    if request.method == 'GET':
        if request.user.role == 'admin' or request.user == course.instructor_id:
            serializer = CourseSerializer(course)
            return Response(serializer.data)
        return Response({'detail': 'Permission denied'}, status=403)

    if request.method == 'PUT':
        if not (request.user.role == 'admin' or (request.user.role == 'teacher' and request.user == course.instructor_id)):
            return Response({'detail': 'Only the course owner (teacher) or admin can update this course.'}, status=403)
        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            # Teachers keep ownership; admin can update without changing owner
            if request.user.role == 'teacher':
                serializer.save(instructor_id=request.user)
            else:
                serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        if not (request.user.role == 'admin' or (request.user.role == 'teacher' and request.user == course.instructor_id)):
            return Response({'detail': 'Only the course owner (teacher) or admin can delete this course.'}, status=403)
        course.delete()
        return Response({'detail': 'Course deleted'}, status=204)

# Lessons: list/create (create only by course instructor)
@swagger_auto_schema(method='post', request_body=LessonSerializer)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lesson_list_create(request):
    if request.method == 'GET':
        course_id = request.query_params.get('course_id')
        qs = Lesson.objects.all()
        if course_id:
            qs = qs.filter(course_id_id=course_id)
        serializer = LessonSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if request.user.role != 'teacher':
            return Response({'detail': 'Only teachers can create lessons.'}, status=403)
        serializer = LessonSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.validated_data['course_id']
            if course.instructor_id != request.user:
                return Response({'detail': 'You can only add lessons to your own courses.'}, status=403)
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# Materials: list/create (create only by course instructor)
@swagger_auto_schema(method='post', request_body=MaterialSerializer)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def material_list_create(request):
    if request.method == 'GET':
        course_id = request.query_params.get('course_id')
        qs = Material.objects.all()
        if course_id:
            qs = qs.filter(course_id_id=course_id)
        serializer = MaterialSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if request.user.role != 'teacher':
            return Response({'detail': 'Only teachers can upload materials.'}, status=403)
        serializer = MaterialSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.validated_data['course_id']
            if course.instructor_id != request.user:
                return Response({'detail': 'You can only add materials to your own courses.'}, status=403)
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# Enrollments: scoped listing; students enroll themselves only
@swagger_auto_schema(method='post', request_body=EnrollmentSerializer)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def enrollment_list_create(request):
    if request.method == 'GET':
        if request.user.role == 'admin':
            qs = Enrollment.objects.all()
        elif request.user.role == 'teacher':
            qs = Enrollment.objects.filter(course_id__instructor_id=request.user)
        else:
            qs = Enrollment.objects.filter(student_id=request.user)
        serializer = EnrollmentSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if request.user.role != 'student':
            return Response({'detail': 'Only students can enroll.'}, status=403)
        serializer = EnrollmentSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.validated_data['course_id']
            if Enrollment.objects.filter(student_id=request.user, course_id=course).exists():
                return Response({'detail': 'Already enrolled.'}, status=400)
            serializer.save(student_id=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# Q&A: list/create (students must be enrolled to post)
@swagger_auto_schema(method='post', request_body=QuestionAnswerSerializer)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def questionanswer_list_create(request):
    if request.method == 'GET':
        lesson_id = request.query_params.get('lesson_id')
        qs = QuestionAnswer.objects.all()
        if lesson_id:
            qs = qs.filter(lesson_id_id=lesson_id)
        serializer = QuestionAnswerSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = QuestionAnswerSerializer(data=request.data)
        if serializer.is_valid():
            lesson = serializer.validated_data['lesson_id']
            course = lesson.course_id
            if request.user.role == 'student':
                is_enrolled = Enrollment.objects.filter(student_id=request.user, course_id=course, is_active=True).exists()
                if not is_enrolled:
                    return Response({'detail': 'You must be enrolled to ask questions.'}, status=403)
            serializer.save(user_id=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
