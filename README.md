# Hướng Tiếp Cận Mới: Phát Triển Phần Mềm Dưới Dạng Workflow

Ref:
- https://kislayverma.com/software-architecture/architecture-pattern-orchestration-via-workflows/
- https://github.com/RxSwiftCommunity/RxFlow
- https://temporal.io/resources

Tôi sẽ giải thích chi tiết về cách tiếp cận phát triển phần mềm dưới dạng workflow và hướng dẫn bạn áp dụng phương pháp này thông qua một tutorial.

## Giải thích khái niệm

Hướng tiếp cận "Software Development as Workflow" xem phát triển phần mềm như một tập hợp các luồng công việc (workflow) thay vì các chức năng riêng lẻ. Mỗi workflow đại diện cho một chuỗi các hành động mà người dùng thực hiện để đạt được một mục tiêu cụ thể. Điều này giúp tập trung vào trải nghiệm người dùng và các trạng thái mà họ trải qua trong quá trình sử dụng phần mềm.

Cách tiếp cận này sử dụng mô hình máy trạng thái (State Machine) và mẫu thiết kế hướng sự kiện (Event-Driven pattern) để quản lý luồng làm việc một cách rõ ràng và mạnh mẽ.

## Tutorial: Xây dựng một ứng dụng với hướng tiếp cận workflow

Trong tutorial này, chúng ta sẽ áp dụng phương pháp phát triển phần mềm dựa trên workflow để xây dựng một ứng dụng đơn giản có chức năng đăng ký và đăng nhập.

### Bước 1: Xác định workflow cụ thể

Chúng ta sẽ tập trung vào hai workflow chính:
1. **Registration workflow** - Đăng ký tài khoản mới
2. **Login workflow** - Đăng nhập vào hệ thống

#### Vẽ workflow đăng ký (Registration)

#### Vẽ workflow đăng nhập (Login)

### Bước 2: Xác định input/output và trạng thái (state) cho mỗi workflow

#### Registration Workflow

**Trạng thái (States):**
- `IDLE`: Trạng thái khởi tạo
- `FORM_INPUT`: Người dùng đang nhập thông tin đăng ký
- `VALIDATING`: Đang xác thực dữ liệu form
- `SUBMITTING`: Đang gửi dữ liệu đăng ký đến server
- `EMAIL_VERIFICATION`: Chờ xác thực email
- `COMPLETED`: Hoàn thành đăng ký

**Input/Output:**
- Input: Thông tin đăng ký (email, mật khẩu, tên người dùng...)
- Output: Tài khoản đã được tạo và xác minh

**Events:**
- `OPEN_FORM`: Mở form đăng ký
- `SUBMIT_FORM`: Gửi thông tin đăng ký
- `VALIDATION_FAILED`: Xác thực form thất bại
- `VALIDATION_SUCCESS`: Xác thực form thành công
- `API_ERROR`: Lỗi khi gọi API
- `REGISTRATION_SUCCESS`: Đăng ký thành công
- `VERIFY_EMAIL_SUCCESS`: Xác thực email thành công
- `VERIFY_EMAIL_FAILED`: Xác thực email thất bại

#### Login Workflow

**Trạng thái (States):**
- `IDLE`: Trạng thái khởi tạo
- `FORM_INPUT`: Người dùng đang nhập thông tin đăng nhập
- `VALIDATING`: Đang xác thực dữ liệu form
- `AUTHENTICATING`: Đang xác thực thông tin đăng nhập
- `MFA_REQUIRED`: Yêu cầu xác thực đa yếu tố
- `SUCCESS`: Đăng nhập thành công

**Input/Output:**
- Input: Thông tin đăng nhập (email/username, mật khẩu)
- Output: Trạng thái xác thực của người dùng, token

**Events:**
- `OPEN_FORM`: Mở form đăng nhập
- `SUBMIT_FORM`: Gửi thông tin đăng nhập
- `VALIDATION_FAILED`: Xác thực form thất bại
- `VALIDATION_SUCCESS`: Xác thực form thành công
- `AUTH_FAILED`: Xác thực không thành công
- `AUTH_SUCCESS`: Xác thực thành công
- `REQUIRE_MFA`: Yêu cầu xác thực 2 lớp
- `SUBMIT_MFA`: Gửi mã xác thực 2 lớp

### Bước 3: Xây dựng Workflow Engine dựa trên XState

XState là một thư viện JavaScript giúp triển khai máy trạng thái (State Machine) một cách dễ dàng. Dưới đây là cách xây dựng Workflow Engine sử dụng XState:

#### 3.1. Cài đặt dependencies

```bash
npm install xstate @xstate/react
```

#### 3.2. Tạo Registration Machine

```typescript
// src/machines/registrationMachine.ts
import { createMachine } from 'xstate';

export const registrationMachine = createMachine({
  id: 'registration',
  initial: 'idle',
  states: {
    idle: {
      on: {
        OPEN_FORM: 'formInput'
      }
    },
    formInput: {
      on: {
        SUBMIT_FORM: 'validating'
      }
    },
    validating: {
      on: {
        VALIDATION_SUCCESS: 'submitting',
        VALIDATION_FAILED: 'formInput'
      }
    },
    submitting: {
      on: {
        REGISTRATION_SUCCESS: 'emailVerification',
        API_ERROR: 'formInput'
      }
    },
    emailVerification: {
      on: {
        VERIFY_EMAIL_SUCCESS: 'completed',
        VERIFY_EMAIL_FAILED: 'emailVerification'
      }
    },
    completed: {
      type: 'final'
    }
  }
});
```

#### 3.3. Tạo Login Machine

```typescript
// src/machines/loginMachine.ts
import { createMachine } from 'xstate';

export const loginMachine = createMachine({
  id: 'login',
  initial: 'idle',
  states: {
    idle: {
      on: {
        OPEN_FORM: 'formInput'
      }
    },
    formInput: {
      on: {
        SUBMIT_FORM: 'validating'
      }
    },
    validating: {
      on: {
        VALIDATION_SUCCESS: 'authenticating',
        VALIDATION_FAILED: 'formInput'
      }
    },
    authenticating: {
      on: {
        AUTH_SUCCESS: 'success',
        AUTH_FAILED: 'formInput',
        REQUIRE_MFA: 'mfaRequired'
      }
    },
    mfaRequired: {
      on: {
        SUBMIT_MFA: 'authenticating'
      }
    },
    success: {
      type: 'final'
    }
  }
});
```

### Bước 4: Xây dựng API service để kết nối với Backend

#### 4.1. Tạo API Service

```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authService = {
  async register(data: RegistrationData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  async submitMFA(code: string) {
    const response = await api.post('/auth/mfa', { code });
    return response.data;
  }
};

export type RegistrationData = {
  email: string;
  password: string;
  username: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};
```

### Bước 5: Xây dựng UI dựa trên State từ Engine

#### 5.1. Registration Form Component

```typescript
// src/components/RegistrationForm.tsx
import React from 'react';
import { useMachine } from '@xstate/react';
import { registrationMachine } from '../machines/registrationMachine';
import { authService } from '../services/api';

export const RegistrationForm: React.FC = () => {
  const [state, send] = useMachine(registrationMachine);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    username: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    send('SUBMIT_FORM');
    
    try {
      await authService.register(formData);
      send('REGISTRATION_SUCCESS');
    } catch (error) {
      send('API_ERROR');
    }
  };

  return (
    <div className="registration-form">
      {state.matches('idle') && (
        <button onClick={() => send('OPEN_FORM')}>
          Register Now
        </button>
      )}

      {state.matches('formInput') && (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
          <button type="submit">Register</button>
        </form>
      )}

      {state.matches('emailVerification') && (
        <div>
          Please check your email to verify your account
        </div>
      )}

      {state.matches('completed') && (
        <div>
          Registration completed! You can now login.
        </div>
      )}
    </div>
  );
};
```

#### 5.2. Login Form Component

```typescript
// src/components/LoginForm.tsx
import React from 'react';
import { useMachine } from '@xstate/react';
import { loginMachine } from '../machines/loginMachine';
import { authService } from '../services/api';

export const LoginForm: React.FC = () => {
  const [state, send] = useMachine(loginMachine);
  const [credentials, setCredentials] = React.useState({
    email: '',
    password: ''
  });
  const [mfaCode, setMfaCode] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    send('SUBMIT_FORM');
    
    try {
      const response = await authService.login(credentials);
      if (response.requireMFA) {
        send('REQUIRE_MFA');
      } else {
        send('AUTH_SUCCESS');
      }
    } catch (error) {
      send('AUTH_FAILED');
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.submitMFA(mfaCode);
      send('AUTH_SUCCESS');
    } catch (error) {
      send('AUTH_FAILED');
    }
  };

  return (
    <div className="login-form">
      {state.matches('idle') && (
        <button onClick={() => send('OPEN_FORM')}>
          Login
        </button>
      )}

      {state.matches('formInput') && (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={e => setCredentials({...credentials, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={e => setCredentials({...credentials, password: e.target.value})}
          />
          <button type="submit">Login</button>
        </form>
      )}

      {state.matches('mfaRequired') && (
        <form onSubmit={handleMFASubmit}>
          <input
            type="text"
            placeholder="Enter MFA Code"
            value={mfaCode}
            onChange={e => setMfaCode(e.target.value)}
          />
          <button type="submit">Verify</button>
        </form>
      )}

      {state.matches('success') && (
        <div>
          Login successful!
        </div>
      )}
    </div>
  );
};
```