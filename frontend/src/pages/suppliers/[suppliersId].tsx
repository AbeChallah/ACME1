import { mdiChartTimelineVariant, mdiUpload } from '@mdi/js';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

import CardBox from '../../components/CardBox';
import LayoutAuthenticated from '../../layouts/Authenticated';
import SectionMain from '../../components/SectionMain';
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton';
import { getPageTitle } from '../../config';

import { Field, Form, Formik } from 'formik';
import FormField from '../../components/FormField';
import BaseDivider from '../../components/BaseDivider';
import BaseButtons from '../../components/BaseButtons';
import BaseButton from '../../components/BaseButton';
import FormCheckRadio from '../../components/FormCheckRadio';
import FormCheckRadioGroup from '../../components/FormCheckRadioGroup';
import FormFilePicker from '../../components/FormFilePicker';
import FormImagePicker from '../../components/FormImagePicker';
import { SelectField } from '../../components/SelectField';
import { SelectFieldMany } from '../../components/SelectFieldMany';
import { SwitchField } from '../../components/SwitchField';
import { RichTextField } from '../../components/RichTextField';

import { update, fetch } from '../../stores/suppliers/suppliersSlice';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { saveFile } from '../../helpers/fileSaver';
import dataFormatter from '../../helpers/dataFormatter';
import ImageField from '../../components/ImageField';

const EditSuppliers = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const initVals = {
    company_name: '',

    contact_name: '',

    contact_email: '',

    phone: '',

    address: '',
  };
  const [initialValues, setInitialValues] = useState(initVals);

  const { suppliers } = useAppSelector((state) => state.suppliers);

  const { suppliersId } = router.query;

  useEffect(() => {
    dispatch(fetch({ id: suppliersId }));
  }, [suppliersId]);

  useEffect(() => {
    if (typeof suppliers === 'object') {
      setInitialValues(suppliers);
    }
  }, [suppliers]);

  useEffect(() => {
    if (typeof suppliers === 'object') {
      const newInitialVal = { ...initVals };

      Object.keys(initVals).forEach(
        (el) => (newInitialVal[el] = suppliers[el] || ''),
      );

      setInitialValues(newInitialVal);
    }
  }, [suppliers]);

  const handleSubmit = async (data) => {
    await dispatch(update({ id: suppliersId, data }));
    await router.push('/suppliers/suppliers-list');
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit suppliers')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={'Edit suppliers'}
          main
        >
          {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values) => handleSubmit(values)}
          >
            <Form>
              <FormField label='CompanyName'>
                <Field name='company_name' placeholder='CompanyName' />
              </FormField>

              <FormField label='ContactName'>
                <Field name='contact_name' placeholder='ContactName' />
              </FormField>

              <FormField label='ContactEmail'>
                <Field name='contact_email' placeholder='ContactEmail' />
              </FormField>

              <FormField label='Phone'>
                <Field name='phone' placeholder='Phone' />
              </FormField>

              <FormField label='Address' hasTextareaHeight>
                <Field name='address' as='textarea' placeholder='Address' />
              </FormField>

              <BaseDivider />
              <BaseButtons>
                <BaseButton type='submit' color='info' label='Submit' />
                <BaseButton type='reset' color='info' outline label='Reset' />
                <BaseButton
                  type='reset'
                  color='danger'
                  outline
                  label='Cancel'
                  onClick={() => router.push('/suppliers/suppliers-list')}
                />
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

EditSuppliers.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'UPDATE_SUPPLIERS'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default EditSuppliers;
