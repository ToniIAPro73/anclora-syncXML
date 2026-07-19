export function getInternalReplyTo() {
  return process.env.RESEND_REPLY_TO || process.env.ADMIN_EMAILS || undefined;
}
