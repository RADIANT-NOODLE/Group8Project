/*
=========================================================
VALORA INQUIRY STORAGE
=========================================================

This file provides one shared inquiry data source for
VALORA.

Inquiries can eventually be created from:

- Public property pages
- Buyer / investor accounts
- Resident / investor property inquiries
- Estate Agent workflows

Estate Agents can then view and update the inquiry status.

Storage key:
valoraInquiries
=========================================================
*/

const STORAGE_KEY = "valoraInquiries";

/*
=========================================================
GET ALL INQUIRIES
=========================================================
*/

export function getInquiries() {

    const storedInquiries =
        localStorage.getItem(STORAGE_KEY);

    if (storedInquiries) {

        try {

            return JSON.parse(
                storedInquiries
            );

        } catch (error) {

            console.error(
                "Unable to read VALORA inquiry storage:",
                error
            );

        }

    }

    const initialInquiries = [];

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialInquiries)
    );

    return initialInquiries;
}

/*
=========================================================
SAVE ALL INQUIRIES
=========================================================
*/

export function saveInquiries(
    updatedInquiries
) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedInquiries)
    );

    return updatedInquiries;
}

/*
=========================================================
GET ONE INQUIRY
=========================================================
*/

export function getInquiryById(
    inquiryId
) {

    const allInquiries =
        getInquiries();

    return (
        allInquiries.find(
            (inquiry) =>
                inquiry.id === inquiryId
        ) || null
    );

}

/*
=========================================================
ADD NEW INQUIRY
=========================================================
*/

export function addInquiry(
    inquiry
) {

    const allInquiries =
        getInquiries();

    const newInquiry = {

        id:
            inquiry.id ||
            `INQ-${Date.now()}`,

        propertyId:
            inquiry.propertyId ||
            null,

        propertyUnit:
            inquiry.propertyUnit ||
            "",

        buyerId:
            inquiry.buyerId ||
            null,

        buyerName:
            inquiry.buyerName ||
            "",

        buyerEmail:
            inquiry.buyerEmail ||
            "",

        buyerContact:
            inquiry.buyerContact ||
            "",

        message:
            inquiry.message ||
            "",

        date:
            inquiry.date ||
            new Date().toISOString(),

        status:
            inquiry.status ||
            "New",

        assignedAgentId:
            inquiry.assignedAgentId ||
            null,

        assignedAgentName:
            inquiry.assignedAgentName ||
            null,

    };

    const updatedInquiries = [
        ...allInquiries,
        newInquiry,
    ];

    saveInquiries(
        updatedInquiries
    );

    return newInquiry;
}

/*
=========================================================
UPDATE INQUIRY
=========================================================
*/

export function updateInquiry(
    inquiryId,
    updates
) {

    const allInquiries =
        getInquiries();

    const updatedInquiries =
        allInquiries.map(
            (inquiry) => {

                if (
                    inquiry.id !==
                    inquiryId
                ) {
                    return inquiry;
                }

                return {
                    ...inquiry,
                    ...updates,
                };

            }
        );

    saveInquiries(
        updatedInquiries
    );

    return (
        updatedInquiries.find(
            (inquiry) =>
                inquiry.id ===
                inquiryId
        ) || null
    );
}

/*
=========================================================
DELETE INQUIRY
=========================================================
*/

export function deleteInquiry(
    inquiryId
) {

    const allInquiries =
        getInquiries();

    const updatedInquiries =
        allInquiries.filter(
            (inquiry) =>
                inquiry.id !==
                inquiryId
        );

    saveInquiries(
        updatedInquiries
    );

    return updatedInquiries;
}

/*
=========================================================
RESET INQUIRIES
=========================================================

Useful during development if you want to clear all
test inquiries.
=========================================================
*/

export function resetInquiries() {

    localStorage.removeItem(
        STORAGE_KEY
    );

    const initialInquiries = [];

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            initialInquiries
        )
    );

    return initialInquiries;
}

/*
=========================================================
DEFAULT EXPORT
=========================================================
*/

export default {

    getInquiries,

    saveInquiries,

    getInquiryById,

    addInquiry,

    updateInquiry,

    deleteInquiry,

    resetInquiries,

};
