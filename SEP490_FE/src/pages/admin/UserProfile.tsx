import React from 'react';
import UserProfileCommon from '@/shared/components/common/UserProfileCommon';
import { useAuth } from '@/shared/hooks/business/useAuth';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <UserProfileCommon 
      user={user}
      title="Thông tin cá nhân"
      roleName="Admin"
      roleColor="bg-gray-100 text-gray-800"
    />
  );
};

export default UserProfile;
