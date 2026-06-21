from rest_framework.permissions import BasePermission


class IsRole(BasePermission):
    allowed_roles: set[str] = set()

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return getattr(user, 'role', None) in self.allowed_roles


class IsCitizen(IsRole):
    allowed_roles = {'citizen'}


class IsDispatcher(IsRole):
    allowed_roles = {'dispatcher'}


class IsResponder(IsRole):
    allowed_roles = {'responder'}


class IsHospital(IsRole):
    allowed_roles = {'hospital'}
