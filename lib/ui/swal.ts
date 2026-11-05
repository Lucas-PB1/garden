import BaseSwal from "sweetalert2";

/**
 * SweetAlert2 instance with the Love Garden visual identity applied by default.
 * Colors and typography are defined in `app/globals.css` under the `.lg-swal` classes.
 */
const Swal = BaseSwal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  customClass: {
    popup: "lg-swal-popup",
    title: "lg-swal-title",
    htmlContainer: "lg-swal-text",
    confirmButton: "lg-swal-confirm",
    cancelButton: "lg-swal-cancel",
    denyButton: "lg-swal-cancel",
    input: "lg-swal-input",
    validationMessage: "lg-swal-validation",
    actions: "lg-swal-actions",
  },
});

/**
 * Brand-styled destructive confirmation button class, for delete prompts.
 */
export const dangerCustomClass = {
  popup: "lg-swal-popup",
  title: "lg-swal-title",
  htmlContainer: "lg-swal-text",
  confirmButton: "lg-swal-confirm lg-swal-danger",
  cancelButton: "lg-swal-cancel",
  actions: "lg-swal-actions",
};

export default Swal;
