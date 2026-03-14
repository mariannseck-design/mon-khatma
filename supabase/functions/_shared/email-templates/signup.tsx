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

const LOGO_URL = 'https://gtnbjquwlgwgnjlhmxnr.supabase.co/storage/v1/object/public/email-assets/logo.png'

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirme ton email pour {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={siteName} width="120" height="120" style={logo} />
        <Heading style={h1}>Bienvenue sur {siteName} 🌿</Heading>
        <Text style={text}>
          Merci de t'être inscrite sur{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>{' '}
          !
        </Text>
        <Text style={text}>
          Confirme ton adresse email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) en cliquant sur le bouton ci-dessous :
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmer mon email
        </Button>
        <Text style={footer}>
          Si tu n'as pas créé de compte, tu peux ignorer cet email en toute sécurité.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#f9fafb', fontFamily: "'Segoe UI', Arial, sans-serif" }
const container = { padding: '30px 25px', backgroundColor: '#ffffff', borderRadius: '12px', margin: '40px auto', maxWidth: '480px' }
const logo = { margin: '0 auto 20px', display: 'block' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#2d6a4f', margin: '0 0 20px', textAlign: 'center' as const }
const text = { fontSize: '14px', color: '#4a5568', lineHeight: '1.6', margin: '0 0 25px' }
const link = { color: '#2d6a4f', textDecoration: 'underline' }
const button = { backgroundColor: '#2d6a4f', color: '#ffffff', fontSize: '14px', borderRadius: '10px', padding: '12px 24px', textDecoration: 'none', display: 'block', textAlign: 'center' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', textAlign: 'center' as const }
