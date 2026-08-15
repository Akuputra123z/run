---
paths:
  - 'app/Mail/**'
---

# Mail

## Never redeclare $subject on Mailable classes
Mailable subclasses must not declare their own typed/public property named `subject` — Illuminate\Mail\Mailable already declares untyped `public $subject`, and a typed child redeclaration is a PHP fatal compile error ("Type of X must not be defined") that kills the process with no visible error. Use a differently-named promoted property (e.g. `emailSubject`) and reference it in envelope().
