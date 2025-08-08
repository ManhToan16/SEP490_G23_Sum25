import React from 'react';
import UserProfileCommon from '@/shared/components/common/UserProfileCommon';
import { useAuth } from '@/shared/hooks/business/useAuth';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <UserProfileCommon 
      user={user}
      title="Thông tin cá nhân"
      roleName="Y tá"
      roleColor="bg-blue-100 text-blue-800"
    />
  );
};

export default UserProfile;
