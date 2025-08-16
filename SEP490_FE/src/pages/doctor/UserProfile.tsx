import React from 'react';
import UserProfileCommon from '@/shared/components/common/UserProfileCommon';
import { useAuth } from '@/shared/hooks/business/useAuth';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <UserProfileCommon 
      user={user}
      title="Thông tin cá nhân"
      roleName="Bác sĩ"
      roleColor="bg-indigo-100 text-indigo-800"
    />
  );
};

export default UserProfile;
