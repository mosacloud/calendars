/**
 * RecurringEditModal component.
 * Displays options for editing recurring events:
 * this occurrence, this and future, or all occurrences.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal, ModalSize } from "@gouvfr-lasuite/cunningham-react";

import type { RecurringEditModalProps, RecurringEditOption } from "./types";

export const RecurringEditModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: RecurringEditModalProps) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] =
    useState<RecurringEditOption>("this");

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOption("this");
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t("calendar.event.editRecurringTitle")}
      size={ModalSize.SMALL}
      rightActions={
        <>
          <Button color="neutral" onClick={onCancel}>
            {t("calendar.event.cancel")}
          </Button>
          <Button
            color="brand"
            onClick={() => onConfirm(selectedOption)}
          >
            {t("calendar.event.save")}
          </Button>
        </>
      }
    >
      <div className="delete-modal__content">
        <p className="delete-modal__message">
          {t("calendar.event.editRecurringPrompt")}
        </p>
        <div className="delete-modal__options">
          <label className="delete-modal__option">
            <input
              type="radio"
              name="edit-option"
              value="this"
              checked={selectedOption === "this"}
              onChange={(e) =>
                setSelectedOption(e.target.value as RecurringEditOption)
              }
            />
            <span>{t("calendar.event.editThisOccurrence")}</span>
          </label>
          <label className="delete-modal__option">
            <input
              type="radio"
              name="edit-option"
              value="future"
              checked={selectedOption === "future"}
              onChange={(e) =>
                setSelectedOption(e.target.value as RecurringEditOption)
              }
            />
            <span>{t("calendar.event.editThisAndFuture")}</span>
          </label>
          <label className="delete-modal__option">
            <input
              type="radio"
              name="edit-option"
              value="all"
              checked={selectedOption === "all"}
              onChange={(e) =>
                setSelectedOption(e.target.value as RecurringEditOption)
              }
            />
            <span>{t("calendar.event.editAllOccurrences")}</span>
          </label>
        </div>
      </div>
    </Modal>
  );
};
