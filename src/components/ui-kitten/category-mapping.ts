const fontFamily = 'Poppins-Regular';
type category =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 's1'
  | 's2'
  | 'p1'
  | 'p2'
  | 'c1'
  | 'c2'
  | 'label';

export const getFontFamily = (category: string | undefined): string => {
  if (!category) {
    return fontFamily;
  }
  return categories[category as category];
};

const categories = {
  h1: 'Poppins-Bold',
  h2: 'Poppins-Bold',
  h3: 'Poppins-Bold',
  h4: 'Poppins-Bold',
  h5: 'Poppins-Bold',
  h6: 'Poppins-Bold',
  s1: 'Poppins-SemiBold',
  s2: 'Poppins-SemiBold',
  p1: fontFamily,
  p2: fontFamily,
  c1: fontFamily,
  c2: 'Poppins-SemiBold',
  label: 'Poppins-Bold',
};
