import styled from 'styled-components';

export const Container = styled.div`
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  text-align: center;
  background-color: #f9f9f9;
`;

export const DropArea = styled.div`
  border: 2px dashed #aaa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f0f0f0;
  color: #555;
  cursor: pointer;
`;

export const FileName = styled.p`
  font-weight: bold;
  color: #333;
`;

export const Button = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => (props.disabled ? '#aaa' : '#4caf50')};
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 16px;
`;

export const ErrorMessage = styled.p`
  color: red;
  margin-top: 20px;
`;
