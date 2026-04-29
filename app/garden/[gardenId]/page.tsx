"use client";

import GardenLayout from "@/features/gardens/components/GardenLayout";
import GardenPhotoCard from "@/features/gardens/components/GardenPhotoCard";
import PhrasesManagerModal from "@/features/gardens/components/PhrasesManagerModal";
import ShareModal from "@/features/gardens/components/ShareModal";
import SlideshowModal from "@/features/gardens/components/SlideshowModal";
import SpecialDateCounter from "@/features/gardens/components/SpecialDateCounter";
import SpecialDateModal from "@/features/gardens/components/SpecialDateModal";
import ThemeModal from "@/features/gardens/components/ThemeModal";
import { useGarden } from "@/features/gardens/hooks/useGarden";
import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  FaArrowLeft,
  FaCalendarPlus,
  FaCheck,
  FaHeart,
  FaImages,
  FaLink,
  FaPalette,
  FaPen,
  FaPlay,
  FaPlus,
  FaQuoteLeft,
  FaUpload,
  FaUsers,
} from "react-icons/fa";

const getThemeLabel = (bgType: string) => {
  if (bgType === "stars") return "Noite";
  if (bgType === "minimalist") return "Minimalista";
  if (bgType === "custom") return "Personalizado";
  return "Floral";
};

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: "easeOut" },
  },
};

const galleryVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
    },
  },
};

/**
 * Unified Garden Page Component.
 * Supports multiple gardens per user and dynamic access control.
 */
export default function GardenPage() {
  const params = useParams();
  const gardenId = params.gardenId as string;

  const {
    user,
    loading,
    loadingGarden,
    photos,
    uploading,
    loadingPhotos,
    deletingId,
    fileInputRef,
    gardenName,
    isEditingName,
    isOwner,
    isCollaborator,
    tempName,
    setTempName,
    handleFileSelect,
    handleDelete,
    startEditing,
    saveName,
    handleKeyDown,
    showShareModal,
    setShowShareModal,
    specialDate,
    specialDateTitle,
    showDateModal,
    setShowDateModal,
    handleSaveSpecialDate,
    lovePhrases,
    phrasesInputRef,
    handlePhrasesUpload,
    showPhrasesModal,
    setShowPhrasesModal,
    handleSavePhrases,
    updateTheme,
    garden,
    inviteCollaborator,
    removeCollaborator,
  } = useGarden(gardenId);

  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowStartIndex, setSlideshowStartIndex] = useState(0);
  const [showThemeModal, setShowThemeModal] = useState(false);

  if (loading || loadingGarden || loadingPhotos) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rose-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-rose-200 border-t-rose-700" />
      </div>
    );
  }

  if (!user || !garden || !isCollaborator) return null;

  const latestPhoto = photos[0];
  const collaboratorCount = garden.collaboratorIds.length + 1;
  const themeLabel = getThemeLabel(garden.theme.bgType);
  const uploadButtonStyle = {
    background: `linear-gradient(135deg, ${garden.theme.primaryColor}, #9f1239)`,
    boxShadow: `0 18px 48px ${garden.theme.primaryColor}26`,
  };

  const openSlideshow = (index = 0) => {
    setSlideshowStartIndex(index);
    setShowSlideshow(true);
  };

  return (
    <GardenLayout theme={garden.theme}>
      <MotionConfig reducedMotion="user">
        <motion.div
          className="mx-auto max-w-7xl px-2 pb-24 pt-6 md:px-0 md:pb-10"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.header
            className="relative overflow-hidden rounded-lg border border-rose-100 bg-white/90 shadow-[0_22px_80px_rgba(127,29,29,0.10)] backdrop-blur"
            variants={sectionVariants}
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                background: `linear-gradient(90deg, ${garden.theme.primaryColor}, ${garden.theme.secondaryColor})`,
              }}
            />

            <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
              <motion.div className="flex min-w-0 flex-col" variants={sectionVariants}>
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-600 transition hover:border-rose-200 hover:text-rose-700"
                  >
                    <FaArrowLeft className="text-xs" />
                    Dashboard
                  </Link>
                  <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-500">
                    {isOwner ? "Sua coleção" : "Compartilhada"}
                  </span>
                </div>

                {isEditingName && isOwner ? (
                  <div className="flex max-w-3xl items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={saveName}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full border-b border-rose-300 bg-transparent pb-2 text-4xl font-semibold tracking-tight text-stone-950 outline-none md:text-5xl"
                    />
                    <button
                      type="button"
                      onClick={saveName}
                      className="rounded-lg bg-rose-900 p-3 text-white transition hover:bg-rose-800"
                      title="Salvar nome"
                    >
                      <FaCheck />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`group max-w-4xl text-left ${isOwner ? "cursor-pointer" : "cursor-default"}`}
                    onClick={isOwner ? startEditing : undefined}
                  >
                    <span className="flex min-w-0 items-start gap-3">
                      <h1 className="break-words text-4xl font-semibold leading-[0.95] tracking-tight text-stone-950 [overflow-wrap:anywhere] md:text-6xl">
                        {gardenName}
                      </h1>
                      {isOwner && (
                        <FaPen className="mt-2 shrink-0 text-rose-300 opacity-0 transition group-hover:opacity-100" />
                      )}
                    </span>
                  </button>
                )}

                <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
                  {isOwner
                    ? "Um espaço reservado para fotos, datas e detalhes que contam a história de vocês."
                    : "Você pode adicionar memórias a esta coleção compartilhada."}
                </p>

                <motion.div
                  className="mt-5 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4"
                  variants={galleryVariants}
                >
                  {[
                    {
                      icon: FaImages,
                      label: photos.length === 1 ? "foto" : "fotos",
                      value: photos.length,
                    },
                    {
                      icon: FaUsers,
                      label: collaboratorCount === 1 ? "pessoa" : "pessoas",
                      value: collaboratorCount,
                    },
                    {
                      icon: FaQuoteLeft,
                      label: lovePhrases.length === 1 ? "frase" : "frases",
                      value: lovePhrases.length,
                    },
                    { icon: FaHeart, label: "tema", value: themeLabel },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.label}
                        className="min-w-0 rounded-lg border border-rose-100 bg-rose-50/60 px-3 py-3"
                        variants={sectionVariants}
                      >
                        <div className="mb-2 flex items-center gap-2 text-rose-500">
                          <Icon className="text-sm" />
                          <span className="text-[11px] font-bold uppercase tracking-wide">
                            {item.label}
                          </span>
                        </div>
                        <div className="truncate text-lg font-semibold text-rose-950">
                          {item.value}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                <motion.div className="mt-6 flex flex-wrap gap-2" variants={sectionVariants}>
                  {isCollaborator && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      style={uploadButtonStyle}
                      className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {uploading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <FaUpload />
                          Adicionar memória
                        </>
                      )}
                    </button>
                  )}

                  {photos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => openSlideshow(0)}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700"
                    >
                      <FaPlay className="text-rose-400" />
                      Apresentar
                    </button>
                  )}

                  {isOwner && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowShareModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700"
                      >
                        <FaLink className="text-rose-400" />
                        Compartilhar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPhrasesModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700"
                      >
                        <FaQuoteLeft className="text-rose-400" />
                        Frases
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowThemeModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700"
                      >
                        <FaPalette className="text-rose-400" />
                        Tema
                      </button>
                    </>
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                className="relative min-h-[260px] overflow-hidden rounded-lg border border-rose-100 bg-rose-50 shadow-inner"
                variants={sectionVariants}
              >
                {latestPhoto ? (
                  <motion.button
                    type="button"
                    onClick={() => openSlideshow(0)}
                    className="group h-full min-h-[260px] w-full text-left"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <Image
                      src={latestPhoto.url}
                      alt={latestPhoto.caption}
                      fill
                      priority
                      quality={78}
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-rose-100">
                        Última memória
                      </span>
                      <p className="mt-2 text-xl font-semibold">{latestPhoto.caption}</p>
                      {latestPhoto.uploaderName && (
                        <p className="mt-1 text-sm text-white/70">
                          Enviada por {latestPhoto.uploaderName}
                        </p>
                      )}
                    </div>
                  </motion.button>
                ) : (
                  <>
                    <Image
                      src="/bg/floral-bg-v2.png"
                      alt=""
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-white/55" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <FaImages className="mb-4 text-3xl text-rose-400" />
                      <p className="text-xl font-semibold text-stone-950">
                        A primeira foto muda tudo
                      </p>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-stone-600">
                        Adicione uma memória para transformar esta coleção em um álbum vivo.
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            <div className="border-t border-rose-100 px-5 py-5 md:px-7">
              {specialDate ? (
                <motion.div className="group relative" variants={sectionVariants}>
                  <SpecialDateCounter
                    date={specialDate}
                    title={specialDateTitle || "Data especial"}
                  />
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setShowDateModal(true)}
                      className="absolute right-3 top-3 rounded-lg bg-white/90 p-2 text-rose-600 opacity-100 shadow-sm transition hover:bg-rose-50 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Editar data"
                    >
                      <FaPen size={14} />
                    </button>
                  )}
                </motion.div>
              ) : isOwner ? (
                <motion.button
                  type="button"
                  onClick={() => setShowDateModal(true)}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-dashed border-rose-200 bg-rose-50/50 p-4 text-left transition hover:border-rose-300 hover:bg-white"
                  variants={sectionVariants}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-rose-500 shadow-sm">
                      <FaCalendarPlus />
                    </span>
                    <span>
                      <span className="block font-semibold text-stone-950">
                        Marcar data importante
                      </span>
                      <span className="mt-1 block text-sm text-stone-500">
                        Aniversário, Dia dos Namorados ou outro marco de vocês.
                      </span>
                    </span>
                  </span>
                  <FaPlus className="shrink-0 text-rose-400" />
                </motion.button>
              ) : null}
            </div>
          </motion.header>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={phrasesInputRef}
            onChange={handlePhrasesUpload}
            accept="application/json"
            className="hidden"
          />

          <motion.section className="mt-8" variants={sectionVariants}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">
                  Memórias
                </span>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">
                  Álbum de vocês
                </h2>
              </div>
              <span className="text-sm font-semibold text-stone-500">
                {photos.length} {photos.length === 1 ? "foto" : "fotos"}
              </span>
            </div>

            <motion.div
              className="relative z-10 mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5"
              variants={galleryVariants}
            >
              {photos.map((photo, index) => (
                <GardenPhotoCard
                  key={photo.id}
                  photo={photo}
                  phrase={photo.phrase}
                  onDelete={handleDelete}
                  onOpen={() => openSlideshow(index)}
                  deletingId={deletingId}
                  isOwner={isOwner || photo.uploadedBy === user.uid}
                  priority={index < 5}
                />
              ))}

              {photos.length === 0 && !loadingPhotos && isCollaborator && (
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="col-span-full flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-rose-200 bg-white/70 p-8 text-center transition hover:border-rose-300 hover:bg-white md:col-span-2 lg:col-span-2"
                  variants={sectionVariants}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <FaPlus className="mb-4 text-2xl text-rose-400" />
                  <span className="text-xl font-semibold text-stone-950">
                    Adicione a primeira memória
                  </span>
                  <span className="mt-2 max-w-sm text-sm leading-6 text-stone-500">
                    Escolha uma foto que conte uma parte da história de vocês.
                  </span>
                </motion.button>
              )}
            </motion.div>
          </motion.section>

          {isCollaborator && (
            <div className="fixed inset-x-4 bottom-4 z-50 flex gap-2 rounded-lg border border-rose-100 bg-white/95 p-2 shadow-[0_18px_60px_rgba(127,29,29,0.18)] backdrop-blur md:hidden">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={uploadButtonStyle}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-sm font-bold text-white"
              >
                <FaUpload />
                Memória
              </button>
              {photos.length > 0 && (
                <button
                  type="button"
                  onClick={() => openSlideshow(0)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-rose-100 px-4 text-sm font-bold text-rose-700"
                >
                  <FaPlay />
                </button>
              )}
            </div>
          )}

          <AnimatePresence>
            {showShareModal && isOwner && (
              <ShareModal
                gardenId={gardenId}
                onClose={() => setShowShareModal(false)}
                collaborators={garden.collaboratorIds || []}
                onInvite={inviteCollaborator}
                onRemove={removeCollaborator}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showDateModal && isOwner && (
              <SpecialDateModal
                onClose={() => setShowDateModal(false)}
                onSave={handleSaveSpecialDate}
                currentDate={specialDate}
                currentTitle={specialDateTitle}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSlideshow && (
              <SlideshowModal
                photos={photos}
                lovePhrases={lovePhrases}
                theme={garden.theme}
                onClose={() => setShowSlideshow(false)}
                startIndex={slideshowStartIndex}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showPhrasesModal && isOwner && (
              <PhrasesManagerModal
                phrases={lovePhrases}
                onSave={handleSavePhrases}
                onClose={() => setShowPhrasesModal(false)}
                fileInputRef={phrasesInputRef}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showThemeModal && garden && isOwner && (
              <ThemeModal
                onClose={() => setShowThemeModal(false)}
                currentTheme={garden.theme}
                onSave={updateTheme}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </MotionConfig>
    </GardenLayout>
  );
}
