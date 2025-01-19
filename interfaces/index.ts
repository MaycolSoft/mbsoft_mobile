import { ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
type MaterialIconsName = keyof typeof MaterialIcons.glyphMap;


interface ProductImage {
  id: number|null;
  id_empresa: number;
  id_producto: number|null;
  reference: string;
  extension: string;
  image: string|null;
  image_url: string|null;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Product {
  id: number|undefined;
  reference: string;
  description: string;
  sale_price: number;
  costo_price: number;
  id_categoria: string;
  id_unidad: string;
  id_tax: string;
  tax_include: boolean;
  status: boolean;
  images?: ProductImage[];
  [key: string]: any;
}

export interface ProductFormInterface {
  product?: Product;
  onClose?: () => void;
  onSave?: () => void;
}

export interface CategoriaItem {
  id: number;
  description: string;
}

export interface CategoriaUnidadesTax {
  categoria: CategoriaItem[];
  tax: any[]; // Puedes ajustar esto según tus datos de `tax`
  unidad: any[]; // Puedes ajustar esto según tus datos de `unidad`
}

export interface Options {
  label: string;
  value: string | number;
  [key: string]: any;
}

export interface DropdownProps {
  options: Options[];
  value?: string | number; // El valor inicial
  onSelect?: (option: Options) => void;
  style?: ViewStyle;
  iconMode?: boolean;
  label?: string;
  extraButton?: {
    title?: string;
    icon?: MaterialIconsName;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'dark' | 'light';
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
  };
}


export interface CameraComponentProps {
  onClose: () => void; // onClose no devuelve nada, por eso es una función vacía
  onSendImages: (images: string[]) => void; // Recibe un array de strings (las URIs de las imágenes)
}
 

export interface ProductOverlayProps {
  products: Product[];
  numColumns?: number; // Number of columns in the grid
  onPress?: (product: Product) => void;
  onEndReached?: () => void; // When the list is coming to end, while user scrolling 
  loading?:boolean; // for show loading component when loading
}
