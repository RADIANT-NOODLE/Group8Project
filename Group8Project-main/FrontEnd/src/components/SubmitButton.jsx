export default function SubmitButton({ isLoading, children, loadingLabel }) {
  return (
    <button
      className="button button-primary submit-button"
      type="submit"
      disabled={isLoading}
      aria-disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading && <span className="spinner" aria-hidden="true" />}
      <span aria-live="polite">{isLoading ? loadingLabel : children}</span>
    </button>
  );
}
