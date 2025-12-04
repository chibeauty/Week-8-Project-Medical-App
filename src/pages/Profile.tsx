import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DeviceManager } from '@/components/DeviceManager';

export function Profile() {
  const { userProfile, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailSummaries, setEmailSummaries] = useState(false);

  // Load profile data when component mounts or userProfile changes
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setAge(userProfile.age.toString());
      setWeight(userProfile.weight.toString());
      setGender(userProfile.gender);
    }
  }, [userProfile]);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast.loading('Saving your changes...');

    setTimeout(() => {
      if (userProfile) {
        updateProfile({
          ...userProfile,
          name,
          age: parseInt(age),
          weight: parseFloat(weight),
          gender,
        });
      }
      setIsSaving(false);
      toast.dismiss();
      toast.success('Profile updated successfully!');
    }, 1500);
  };

  if (!userProfile) {
    return <div className="p-4">Loading profile...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Manage your personal information, notification settings, and connected devices.</p>
      </header>

      <form onSubmit={handleSaveChanges} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={userProfile.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age" 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input 
                id="weight" 
                type="number" 
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input 
                id="gender" 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <DeviceManager />

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>How you'd like to be notified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts on your device.</p>
              </div>
              <Switch 
                id="push-notifications" 
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-summary" className="text-base">Email Summaries</Label>
                 <p className="text-sm text-muted-foreground">Get weekly health summaries via email.</p>
              </div>
              <Switch 
                id="email-summary"
                checked={emailSummaries}
                onCheckedChange={setEmailSummaries}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}