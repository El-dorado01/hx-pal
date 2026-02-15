'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { User } from '@/components/animate-ui/icons/user';
import { Calendar } from '@/components/animate-ui/icons/calendar';
import { Users } from '@/components/animate-ui/icons/users';
import { MapPin } from '@/components/animate-ui/icons/map-pin';
import { Briefcase } from '@/components/animate-ui/icons/briefcase';
import { Heart } from '@/components/animate-ui/icons/heart';
import { Home } from '@/components/animate-ui/icons/home';
import { UserCircle } from '@/components/animate-ui/icons/user-circle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PatientBiodata } from '@/lib/types';
import { useSession } from '@/lib/SessionContext';
import { toast } from 'sonner';

export function BiodataForm() {
  const router = useRouter();
  const {
    setBiodata,
    nextStage,
    biodata: savedBiodata,
    setIsAnalyzing,
  } = useSession();
  const [selectedGender, setSelectedGender] = React.useState<string>('');
  const [selectedMaritalStatus, setSelectedMaritalStatus] =
    React.useState<string>('');
  const [genderError, setGenderError] = React.useState<string>('');
  const [maritalStatusError, setMaritalStatusError] =
    React.useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PatientBiodata>({
    defaultValues: savedBiodata || undefined,
  });

  // Sync select values with saved biodata
  React.useEffect(() => {
    if (savedBiodata) {
      if (savedBiodata.gender && savedBiodata.gender !== selectedGender) {
        setSelectedGender(savedBiodata.gender);
        setValue('gender', savedBiodata.gender);
      }
      if (
        savedBiodata.maritalStatus &&
        savedBiodata.maritalStatus !== selectedMaritalStatus
      ) {
        setSelectedMaritalStatus(savedBiodata.maritalStatus);
        setValue('maritalStatus', savedBiodata.maritalStatus);
      }
    }
  }, [savedBiodata?.gender, savedBiodata?.maritalStatus, setValue]);

  const onSubmit = (data: PatientBiodata) => {
    // Clear previous errors
    setGenderError('');
    setMaritalStatusError('');

    // Validate select fields manually
    let hasError = false;
    if (!selectedGender) {
      setGenderError('Sex is required');
      hasError = true;
    }
    if (!selectedMaritalStatus) {
      setMaritalStatusError('Marital status is required');
      hasError = true;
    }

    if (hasError) return;

    const completeData = {
      ...data,
      gender: selectedGender,
      maritalStatus: selectedMaritalStatus,
    };

    console.log('Biodata submitted:', completeData);
    // Save biodata to context (this will also add a custom hint)
    setIsAnalyzing(true);
    setBiodata(completeData);
    setIsAnalyzing(false);

    toast.success('Biodata saved');

    // Scroll to hint panel
    setTimeout(() => {
      document
        .getElementById('hx-pal-hint-panel')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    // Navigate to next stage
    nextStage();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-6 max-w-2xl mx-auto p-4'
    >
      {/* Header */}
      <div className='space-y-2'>
        <h1 className='text-xl font-bold uppercase tracking-wider text-primary flex items-center gap-2'>
          <UserCircle className='w-8 h-8' />
          Patient Biodata
        </h1>
        <p className='text-sm text-muted-foreground'>
          Enter the patient's demographic details.
        </p>
      </div>

      {/* Name */}
      <div className='space-y-2'>
        <Label
          htmlFor='name'
          className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider'
        >
          <AnimateIcon animateOnHover>
            <User
              size={18}
              className='text-primary'
            />
          </AnimateIcon>
          Full Name <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='name'
          {...register('name', { required: 'Patient name is required' })}
          placeholder='Enter patient full name'
          className='rounded-none border-2 h-11'
        />
        {errors.name && (
          <p className='text-destructive text-xs'>{errors.name.message}</p>
        )}
      </div>

      {/* Age and Sex - Side by Side */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Age */}
        <div className='space-y-2'>
          <Label
            htmlFor='age'
            className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider'
          >
            <AnimateIcon animateOnHover>
              <Calendar
                size={18}
                className='text-primary'
              />
            </AnimateIcon>
            Age <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='age'
            type='number'
            {...register('age', {
              required: 'Age is required',
              min: { value: 0, message: 'Age must be positive' },
              max: { value: 150, message: 'Please enter a valid age' },
            })}
            placeholder='Enter age in years'
            className='rounded-none border-2 h-11'
          />
          {errors.age && (
            <p className='text-destructive text-xs'>{errors.age.message}</p>
          )}
        </div>

        {/* Sex/Gender */}
        <div className='space-y-2'>
          <Label
            htmlFor='gender'
            className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider'
          >
            <AnimateIcon animateOnHover>
              <Users
                size={18}
                className='text-primary'
              />
            </AnimateIcon>
            Sex <span className='text-destructive'>*</span>
          </Label>
          <Select
            value={selectedGender}
            onValueChange={(value: string) => {
              setSelectedGender(value);
              setValue('gender', value, { shouldValidate: true });
            }}
          >
            <SelectTrigger className='rounded-none border-2 h-11 w-full'>
              <SelectValue placeholder='Select sex' />
            </SelectTrigger>
            <SelectContent className='rounded-none'>
              <SelectItem value='Male'>Male</SelectItem>
              <SelectItem value='Female'>Female</SelectItem>
            </SelectContent>
          </Select>
          {genderError && (
            <p className='text-destructive text-xs'>{genderError}</p>
          )}
        </div>
      </div>

      {/* Tribe and Religion - Side by Side */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Tribe */}
        <div className='space-y-2'>
          <Label
            htmlFor='tribe'
            className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider'
          >
            <AnimateIcon animateOnHover>
              <UserCircle
                size={18}
                className='text-primary'
              />
            </AnimateIcon>
            Tribe <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='tribe'
            {...register('tribe', { required: 'Tribe/ethnicity is required' })}
            placeholder='Enter tribe/ethnicity'
            className='rounded-none border-2 h-11'
          />
          {errors.tribe && (
            <p className='text-destructive text-xs'>{errors.tribe.message}</p>
          )}
        </div>

        {/* Religion */}
        <div className='space-y-2'>
          <Label
            htmlFor='religion'
            className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider'
          >
            <AnimateIcon animateOnHover>
              <Heart
                size={18}
                className='text-primary'
              />
            </AnimateIcon>
            Religion <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='religion'
            {...register('religion', { required: 'Religion is required' })}
            placeholder='Enter religion'
            className='rounded-none border-2 h-11'
          />
          {errors.religion && (
            <p className='text-destructive text-xs'>
              {errors.religion.message}
            </p>
          )}
        </div>
      </div>

      {/* Occupation and Marital Status - Side by Side */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Occupation */}
        <div className='space-y-2'>
          <Label
            htmlFor='occupation'
            className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider'
          >
            <AnimateIcon animateOnHover>
              <Briefcase
                size={18}
                className='text-primary'
              />
            </AnimateIcon>
            Occupation <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='occupation'
            {...register('occupation', { required: 'Occupation is required' })}
            placeholder='Enter occupation'
            className='rounded-none border-2 h-11'
          />
          {errors.occupation && (
            <p className='text-destructive text-xs'>
              {errors.occupation.message}
            </p>
          )}
        </div>

        {/* Marital Status */}
        <div className='space-y-2'>
          <Label
            htmlFor='maritalStatus'
            className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider'
          >
            <AnimateIcon animateOnHover>
              <Heart
                size={18}
                className='text-primary'
              />
            </AnimateIcon>
            Marital Status <span className='text-destructive'>*</span>
          </Label>
          <Select
            value={selectedMaritalStatus}
            onValueChange={(value: string) => {
              setSelectedMaritalStatus(value);
              setValue('maritalStatus', value, { shouldValidate: true });
            }}
          >
            <SelectTrigger className='rounded-none border-2 h-11 w-full'>
              <SelectValue placeholder='Select marital status' />
            </SelectTrigger>
            <SelectContent className='rounded-none'>
              <SelectItem value='Single'>Single</SelectItem>
              <SelectItem value='Married'>Married</SelectItem>
              <SelectItem value='Divorced'>Divorced</SelectItem>
              <SelectItem value='Widowed'>Widowed</SelectItem>
            </SelectContent>
          </Select>
          {maritalStatusError && (
            <p className='text-destructive text-xs'>{maritalStatusError}</p>
          )}
        </div>
      </div>

      {/* Address - Full Width with Textarea */}
      <div className='space-y-2'>
        <Label
          htmlFor='address'
          className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider'
        >
          <AnimateIcon animateOnHover>
            <Home
              size={18}
              className='text-primary'
            />
          </AnimateIcon>
          Address <span className='text-destructive'>*</span>
        </Label>
        <Textarea
          id='address'
          {...register('address', {
            required: 'Residential address is required',
          })}
          placeholder='Enter residential address'
          className='rounded-none border-2 min-h-[80px] resize-none'
          rows={3}
        />
        {errors.address && (
          <p className='text-destructive text-xs'>{errors.address.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className='pt-4 flex flex-col sm:flex-row gap-4'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/dashboard')}
          className='rounded-none flex-1'
        >
          Cancel
        </Button>
        <Button
          type='submit'
          className='rounded-none flex-1 font-bold uppercase tracking-wider'
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
