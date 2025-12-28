import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Dùng để redirect nếu chưa login
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateUser } from '@/store/features/auth/authSlice';
import { authApi } from '../api';
import { UpdateProfileInput } from '../types';

export const useProfile = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Tự động lấy thông tin User khi F5 (Reload trang)
  useEffect(() => {
    // Nếu Redux đã có user thì không cần làm gì
    if (user) return;

    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('token'); 
    console.log("👉 [useProfile] Token tìm thấy:", token);

    if (!token) {
      // Nếu không có token -> Chưa đăng nhập -> Chuyển về trang login
      console.log("👉 [useProfile] Không có token, chuyển hướng về Login");
      router.push('/login'); 
      return;
    }

    // Nếu có token nhưng chưa có user -> Gọi API lấy thông tin
    const fetchMe = async () => {
      console.log("👉 [useProfile] Bắt đầu gọi API getMe...");
      try {
        const response = await authApi.getMe();
        console.log("👉 [useProfile] Kết quả API:", response);

        if (response.data) {
          // Backend AuthController trả về: { success: true, data: { user: {...} } }
          // authApi trả về: response.data (tức là object trên)
          
          // Kiểm tra kỹ cấu trúc response để lấy đúng object User
          const userData = response.data;
          
          console.log("👉 [useProfile] Dữ liệu User sẽ lưu vào Redux:", userData);
          dispatch(updateUser(userData as any));
        } else {
          setError("Không tải được thông tin người dùng");
        }
      } catch (err) {
        console.error("👉 [useProfile] Lỗi khi gọi API:", err);
        // Nếu lỗi 401 (Unauthorized), token hết hạn -> Xóa token và logout
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    fetchMe();
  }, [user, dispatch, router]);

  const saveSettings = async (settings: { allowEmailNotification: boolean; reminderTimes: string[] }) => {
      setIsLoading(true);
      try {
        const response = await authApi.updateSettings(settings);
        
        if (response.data?.success) {
          dispatch(updateUser({
              settings: response.data.data
          })); 
      }
        
        return { success: true };
      } catch (error: any) {
        console.error(error);
        return { success: false, error: error.response?.data?.message || 'Update failed' };
      } finally {
        setIsLoading(false);
      }
    };

  const handleUpdateProfile = async (data: UpdateProfileInput) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authApi.updateProfile(data);
      if (response.success) {
        dispatch(updateUser(response.data));
        setSuccessMessage('Cập nhật hồ sơ thành công!');
        return true;
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Có lỗi xảy ra';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return {
    user,
    isLoading,
    error,
    successMessage,
    updateProfile: handleUpdateProfile,
    saveSettings,
  };
};