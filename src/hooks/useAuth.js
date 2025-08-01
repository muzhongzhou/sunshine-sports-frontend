// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../contexts/auth'; // 从新的文件导入 AuthContext

export const useAuth = () => useContext(AuthContext);