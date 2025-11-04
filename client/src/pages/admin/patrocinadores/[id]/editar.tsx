import { useParams } from "wouter";
import SponsorForm from "../SponsorForm";

export default function EditarPatrocinador() {
  const params = useParams();
  const sponsorId = parseInt(params.id!);

  return <SponsorForm sponsorId={sponsorId} />;
}
