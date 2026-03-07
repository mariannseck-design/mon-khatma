/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const logoUrl = 'https://gtnbjquwlgwgnjlhmxnr.supabase.co/storage/v1/object/public/email-assets/logo.png'

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirme ton adresse email pour Ma Khatma</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} width="64" height="64" alt="Ma Khatma" style={logo} />
        <Heading style={h1}>Bienvenue sur Ma Khatma 🌿</Heading>
        <Text style={text}>
          Qu'Allah te bénisse dans ton parcours avec le Coran !
        </Text>
        <Text style={text}>
          Confirme ton adresse email ({recipient}) pour commencer à utiliser ton compagnon spirituel.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmer mon email
        </Button>
        <Text style={footer}>
          Si tu n'as pas créé de compte sur Ma Khatma, tu peux ignorer cet email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '480px', margin: '0 auto' }
const logo = { margin: '0 0 24px 0', borderRadius: '12px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#2d6a4f',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#4a5568',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const button = {
  backgroundColor: '#2d6a4f',
  color: '#ffffff',
  fontSize: '15px',
  borderRadius: '16px',
  padding: '14px 28px',
  textDecoration: 'none',
  fontWeight: '600' as const,
}
const footer = { fontSize: '12px', color: '#a0aec0', margin: '32px 0 0' }
