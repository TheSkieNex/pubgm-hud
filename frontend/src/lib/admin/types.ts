export interface User {
  email: string;
  createdAt: string;
}

export interface LottieFile {
  uuid: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface ModalData {
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  childrenProps?: any;
  onClose: () => void;
  cancel?: string;
  submit: {
    label: string;
    handler: (e: React.FormEvent<HTMLFormElement>) => void;
  };
}
