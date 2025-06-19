'use client';

import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Profile = () => {
  const { userData } = useAuth();

  if (!userData) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Please login to view your profile.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="p-6">
        <CardHeader className="flex items-center gap-4">
          <div className="w-30 h-30 rounded-full overflow-hidden border-2 border-primary shadow-lg">
            <img
              src={ 'cat.png'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-4xl text-foreground">
              {userData.name || 'Anonymous User'}
            </CardTitle>
            <p className="text-muted-foreground font-bold text-xl">{userData.email}</p>
          </div>
        </CardHeader>

        <CardContent className="mt-4 grid grid-cols-2 gap-6 text-sm text-foreground">
          <div>
            <p className="font-semibold text-muted-foreground mb-1 text-2xl">Interviews Taken</p>
            <p className="text-2xl font-bold text-primary">
              {userData?.interviews?.length || 0}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
