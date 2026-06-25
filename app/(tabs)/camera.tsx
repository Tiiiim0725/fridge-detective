import { type Href, Redirect } from 'expo-router'

export default function CameraTab() {
  return <Redirect href={`/scan?capture=${Date.now()}` as Href} />
}
