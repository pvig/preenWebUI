import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    transition: background-color 0.3s, color 0.3s;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    
    &:hover {
      color: ${props => props.theme.colors.primaryHover};
    }
  }
  
  h3 {
    color: ${props => props.theme.colors.textSecondary};
  }
`;
