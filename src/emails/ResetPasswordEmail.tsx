import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ResetPasswordEmailProps {
  resetUrl: string;
  userEmail: string;
}

export const ResetPasswordEmail = ({
  resetUrl,
  userEmail,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password for TravelGo</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Heading style={logo}>TravelGo</Heading>
        </Section>
        
        <Heading style={h1}>Reset your password</Heading>
        
        <Text style={text}>
          Hello! We received a request to reset your password for your TravelGo account ({userEmail}).
        </Text>
        
        <Text style={text}>
          Click the button below to reset your password:
        </Text>
        
        <Section style={buttonContainer}>
          <Link style={button} href={resetUrl}>
            Reset Password
          </Link>
        </Section>
        
        <Text style={text}>
          If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
        </Text>
        
        <Text style={text}>
          This link will expire in 15 minutes for security reasons.
        </Text>
        
        <Text style={footer}>
          Best regards,<br />
          The TravelGo Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#2563eb',
  margin: '0',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
  cursor: 'pointer',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  textAlign: 'center' as const,
};