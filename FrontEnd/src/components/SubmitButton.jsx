export default function SubmitButton({ isLoading, children, loadingLabel }) {
  return (
    <button className="button button-primary submit-button" type="submit" disabled={isLoading}>
      {isLoading && <span className="spinner" aria-hidden="true" />}
      <span>{isLoading ? loadingLabel : children}</span>
    </button>
  );
}
