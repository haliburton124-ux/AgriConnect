<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Verify your AgriConnect account</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #eef2ea; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
    <span style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
        Your AgriConnect verification code is {{ $otp }}. It expires in 10 minutes.
    </span>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #eef2ea; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px;">
                    {{-- Header --}}
                    <tr>
                        <td align="center" style="padding-bottom: 24px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="background-color: #e8f5e9; border-radius: 14px; padding: 10px 12px; vertical-align: middle;">
                                        <span style="font-size: 22px; line-height: 1;">🌱</span>
                                    </td>
                                    <td style="padding-left: 12px; vertical-align: middle;">
                                        <span style="font-size: 20px; font-weight: 700; color: #2e7d32; letter-spacing: -0.02em;">AgriConnect</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Card --}}
                    <tr>
                        <td style="background-color: #ffffff; border-radius: 20px; border: 1px solid #e3ebe0; box-shadow: 0 8px 32px rgba(46, 125, 50, 0.08); overflow: hidden;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                {{-- Green accent bar --}}
                                <tr>
                                    <td style="height: 4px; background: linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%); font-size: 0; line-height: 0;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding: 36px 32px 28px;">
                                        <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #2e7d32; text-transform: uppercase; letter-spacing: 0.06em;">
                                            Email verification
                                        </p>
                                        <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 700; color: #263238; line-height: 1.25;">
                                            Hello {{ $firstName }},
                                        </h1>
                                        <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #607d8b;">
                                            Use the code below to verify your AgriConnect farmer account. For your security, do not share this code with anyone.
                                        </p>

                                        {{-- OTP box --}}
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td align="center" style="background-color: #f8faf5; border: 1px solid #e3ebe0; border-radius: 16px; padding: 24px 20px;">
                                                    <p style="margin: 0 0 10px; font-size: 12px; font-weight: 600; color: #607d8b; text-transform: uppercase; letter-spacing: 0.08em;">
                                                        Verification code
                                                    </p>
                                                    <p style="margin: 0; font-size: 36px; font-weight: 700; color: #2e7d32; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace;">
                                                        {{ $otp }}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #607d8b; text-align: center;">
                                            This code expires in <strong style="color: #263238;">10 minutes</strong>.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="padding: 24px 16px 8px; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #90a4ae;">
                                If you did not create an AgriConnect account, you can safely ignore this email.
                            </p>
                            <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #b0bec5;">
                                AgriConnect-IN &middot; Ilocos Norte Agricultural Extension Platform
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
