import React from "react";

/**
 * Live checklist of the password policy. `rules` comes from
 * `checkPasswordRules()`; nothing is marked as failed until the person starts
 * typing (`touched`).
 */
function PasswordRequirements({ id, rules, touched }) {
    return (
        <ul className="auth-password-rules" id={id} aria-live="polite">
            {rules.map((rule) => {
                const state = !touched ? "idle" : rule.met ? "met" : "unmet";

                return (
                    <li key={rule.id} className={`auth-password-rule auth-password-rule-${state}`}>
                        <span aria-hidden="true" className="auth-password-rule-mark">
                            {state === "met" ? "✓" : "•"}
                        </span>
                        <span>
                            {rule.label}
                            <span className="auth-visually-hidden">
                                {state === "met" ? " (met)" : state === "unmet" ? " (not met yet)" : ""}
                            </span>
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

export default PasswordRequirements;
