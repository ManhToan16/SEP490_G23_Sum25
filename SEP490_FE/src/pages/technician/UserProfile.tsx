import React from 'react';
import UserProfileCommon from '@/shared/components/common/UserProfileCommon';
import { useAuth } from '@/shared/hooks/business/useAuth';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <UserProfileCommon 
      user={user}
      title="Thông tin cá nhân"
      roleName="Kỹ thuật viên"
      roleColor="bg-purple-100 text-purple-800"
    />
  );
};

export default UserProfile;
